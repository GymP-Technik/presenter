import { fetch, Agent, Response } from "npm:undici";

import * as path from "https://deno.land/std@0.181.0/path/mod.ts";

import log from "../utils/log.ts";
import services from "./services.ts";

import * as crypto from "local/src/utils/crypto.ts";

import { sleep } from "../utils/promises.ts";

const docker = {
	reachable: async function (retry = false) {
		let reachable = false;

		do {
			try {
				const before = Date.now();

				// Check if reachable
				const pong = await fetch(`${this.utils.url()}/_ping`, {
					signal: AbortSignal.timeout(3000),
					dispatcher: new Agent({
						connect: {
							socketPath: "/var/run/docker.sock",
						},
					}),
				});

				if (!pong.ok) {
					throw new Error("[docker] Unable to reach engine: " + pong.statusText);
				}

				const text = await pong.text();

				log.info(`[docker] Reached engine in ${Math.ceil((Date.now() - before) / 1000)}s: '${text}'`);

				reachable = true;
			} catch (err) {
				if (retry) {
					log.error("[docker] Unable to reach engine: " + err.message);

					// Wait 3 seconds
					await sleep(3 * 1000);
				} else {
					throw new Error("[docker] Unable to reach engine: " + err.message);
				}
			}
		} while (retry && !reachable);
	},

	helpers: {
		ensureServices: async function () {
			let changed = false;

			// Get all internal services, later all services left will be deleted
			const internalServices: { [key: string]: any } = {};

			await docker.services.list("internal").then((services) =>
				services.forEach((service: any) => {
					internalServices[service.Spec.Name] = service;
				})
			);

			// Iterate over wanted services
			for await (const service of services) {
				const hashed = await crypto.hash(JSON.stringify(service));

				// Check if service already exits
				if (internalServices[service.name]) {
					// Compare hashes of services to see if service has changed
					if (internalServices[service.name].Spec?.Labels?.["hash"] === hashed) {
						// Service has not changed
						log.debug(`[docker] Internal service '${service.name}' unchanged`);

						delete internalServices[service.name];
						continue;
					} else {
						// Service has changed -> Delete and recreate
						log.debug(
							`[docker] Deleting internal service '${service.name}' due to change in spec`
						);

						try {
							await docker.utils.delete(`/services/${internalServices[service.name].ID}`);
						} catch (err) {
							throw new Error(
								`[docker] Error while deleting internal service '${service.name}': ${err}`
							);
						}

						log.debug(`[docker] Successfully deleted internal service '${service.name}'`);

						delete internalServices[service.name];

						changed = true;
					}
				}

				log.debug(`[docker] Creating internal service '${service.name}'...`);

				// Build ports spec
				const portsSpec: any[] = [];

				service.ports.forEach((port) => {
					const source = port.split(":")[0];
					const target = port.split(":")[1];

					if (!source || !target) {
						throw new Error(
							`[docker] Error mapping ports loading internal service '${service.name}'`
						);
					}

					portsSpec.push({
						Protocol: "tcp",
						TargetPort: parseInt(source),
						PublishedPort: parseInt(target),
						PublishMode: "host",
					});
				});

				// Build mount spec
				const mountSpec: any[] = [];

				for (const mount of service.mounts) {
					if (mount.source === undefined || mount.target === undefined) {
						throw new Error(
							`[docker] Error mapping mounts loading internal service '${service.name}'`
						);
					}

					// Ashur target folder exits
					try {
						await Deno.mkdir(path.join(Deno.cwd(), mount.source), { recursive: true });
					} catch (_err) {
						log.debug(`[docker] Skipping ${path.join(Deno.cwd(), mount.source)}`);
					}

					mountSpec.push({
						Source: path.join(Deno.cwd(), mount.source),
						Target: mount.target,
						Type: "bind",
					});
				}

				// Create a new service with the spec
				const body = {
					Name: service.name,
					Labels: {
						hash: hashed,
						type: "internal",
						["internal"]: "type",
					},
					TaskTemplate: {
						ContainerSpec: {
							Env: service.env,
							Image: service.image,
							Hostname: service.name,
							Mounts: mountSpec,
							Isolation: "default",
							User: "0",
						},
						Placement: {
							Constraints: ["node.role==manager"],
						},
						ForceUpdate: 0,
						Runtime: "container",
					},
					Mode: {
						Replicated: {
							Replicas: 1,
						},
					},
					EndpointSpec: {
						Mode: "vip",
						Ports: portsSpec,
					},
				};

				// @ts-expect-error Property 'Command' does not exist on type '{ Env: string[] | undefined; Image: string; Hostname: string; Mounts: any[]; Isolation: string; }'.deno-ts(2339)
				if (service.command !== undefined) body.TaskTemplate.ContainerSpec.Command = service.command;

				try {
					await docker.utils.post(`/services/create`, body);
				} catch (err) {
					throw new Error(`[docker] Error creating internal service '${service.name}': ${err}`);
				}

				log.debug(`[docker] Successfully created internal service '${service.name}'`);

				changed = true;
			}

			// Delete unused internal services
			for (const [name, _spec] of Object.entries(internalServices)) {
				try {
					await docker.utils.delete(`/services/${name}`);
				} catch (err) {
					throw new Error(
						`[docker] Error while deleting unused internal service '${name}': ${err}`
					);
				}

				log.debug(`[docker] Successfully deleted unused internal service '${name}'`);

				changed = true;
			}

			log.info(`[docker] Verified internal services`);

			if (changed) {
				// Wait for service to startup
				log.info(`[docker] Waiting 10s for services to get ready`);

				await sleep(10 * 1000);
			}
		},

		ensureSwarm: async function () {
			// Check if reachable
			const res = await fetch(`${docker.utils.url()}/swarm`, {
				dispatcher: new Agent({
					connect: {
						socketPath: "/var/run/docker.sock",
					},
				}),
			});

			// Node part of swarm
			if (res.ok) {
				const body = (await res.json()) as any;
				log.info(`[docker] Node already part of swarm '${body["Spec"]["Name"]}' | '${body["ID"]}'`);
			} else {
				// Create new swarm
				log.warning(`[docker] Node not part of any swarm`);
				log.info(`[docker] Creating swarm...`);

				try {
					const body = await docker.utils.post(`/swarm/init`, {
						ListenAddr: "127.0.0.1",
						AdvertiseAddr: "127.0.0.1",
						Spec: {
							Labels: {
								created: Date.toString(),
								owner: "Presenter",
							},
						},
					});

					log.info(`[docker] Create swarm '${body}'`);
				} catch (err) {
					throw new Error(`[docker] Error while creating swarm: ${err}`);
				}
			}
		},
	},

	services: {
		list: async function (type: string) {
			return await docker.utils.get(
				`/services?filters=${JSON.stringify({
					label: [type],
				})}`
			);
		},
	},

	utils: {
		url: function () {
			return `http://127.0.0.1`;
		},

		verify: async function (res: Response) {
			if (!res.ok) {
				let body;

				try {
					body = await res.text();
				} catch (_err) {
					// Can fail
				}

				throw new Error(`Error '${res.status}' fetching '${res.url}': ${res.statusText}\n${body}`);
			}
		},

		parse: function (body: any) {
			try {
				body = JSON.parse(body);
			} catch (_err) {
				// Can fail
			}

			return body;
		},

		post: async function (url: string, body: any, headers = {}) {
			const req = await fetch(`${docker.utils.url()}${url}`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					...headers,
				},
				body: JSON.stringify(body),
				dispatcher: new Agent({
					connect: {
						socketPath: "/var/run/docker.sock",
					},
				}),
				duplex: "half",
			});

			await docker.utils.verify(req);

			return await docker.utils.parse(await req.text());
		},

		get: async function (url: string, headers = {}) {
			const req = await fetch(`${docker.utils.url()}${url}`, {
				method: "GET",
				headers: {
					...headers,
				},
				dispatcher: new Agent({
					connect: {
						socketPath: "/var/run/docker.sock",
					},
				}),
			});

			await docker.utils.verify(req);

			return await docker.utils.parse(await req.text());
		},

		delete: async function (url: string, headers = {}) {
			const req = await fetch(`${docker.utils.url()}${url}`, {
				method: "DELETE",
				headers: {
					...headers,
				},
				dispatcher: new Agent({
					connect: {
						socketPath: "/var/run/docker.sock",
					},
				}),
			});

			await docker.utils.verify(req);

			return await docker.utils.parse(await req.text());
		},
	},
};

export default docker;
