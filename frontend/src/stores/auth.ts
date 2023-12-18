import { writable } from "svelte/store";
import { push } from "svelte-spa-router";

function parseJwt(token: string) {
	var base64Url = token.split(".")[1];
	var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	var jsonPayload = decodeURIComponent(
		window
			.atob(base64)
			.split("")
			.map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join("")
	);

	return JSON.parse(jsonPayload);
}

export const AuthError = {
	Expired: "Timeout",
	Invalid: "Wrong password or username",
};

function useAuth() {
	// Default state
	const defaultState: {
		authenticated: boolean;
		roles: string[];
		validUntil: number;
		error: undefined | string;
	} = {
		authenticated: false,
		roles: [],
		validUntil: 0,
		error: undefined,
	};

	let unknown = true;

	function logout() {
		localStorage.removeItem("auth");
		set(defaultState);

		push("/");
	}

	async function login(username: string, password: string) {
		const res = await fetch(`${window.apiHost}/login`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		if (res.ok) {
			// Logged in
			const jwt = (await res.json()).jwt;
			const content = parseJwt(jwt);

			set({
				authenticated: true,
				roles: content.roles,
				validUntil: content.validUntil,
				error: undefined,
			});

			localStorage.setItem("auth", jwt);

			return {
				success: true,
			};
		} else {
			set({
				...defaultState,
				error: AuthError.Invalid,
			});

			return {
				success: false,
				error: AuthError.Invalid,
			};
		}
	}

	const { subscribe, set, update } = writable<typeof defaultState>(
		{ ...defaultState, ...{ loading: true } },
		function start() {
			if (unknown) {
				if (localStorage.getItem("auth") !== null) {
					// Parse jwt
					const content = parseJwt(localStorage.getItem("auth")!);

					if (content.expire < Date.now()) {
						// Expired JWT
						set({
							...defaultState,
							error: AuthError.Expired,
						});
					}

					// Store JWT
					set({
						authenticated: true,
						roles: content.roles,
						validUntil: content.validUntil,
						error: undefined,
					});
				}

				unknown = false;
			}
		}
	);

	// Store store
	const store = {
		subscribe,
		login,
		logout,
	};

	return store;
}

export default useAuth();
