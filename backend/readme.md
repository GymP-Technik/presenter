# backend

[Deno](https://deno.com/) webserver running on [<http://localhost:3001>](http://localhost:3001).
Connects via UNIX socket to running docker daemon to create a mongoDB instance.

Default user: 'root' 'password'

## Installation

Tested on Ubuntu 22.04.

Install Docker:

- [Convenience Script](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)
- [Non-root Guide](https://docs.docker.com/engine/install/linux-postinstall/)
  - `sudo groupadd docker`
  - `sudo usermod -aG docker $USER`
  - `newgrp docker`

Install Deno:

```shell
curl -fsSL https://deno.land/x/install/install.sh | sh
```

Clone from repo (in ~):

```shell
git clone https://github.com/GymP-Technik/presenter.git 
```

Setup autostart (append to end of `~/.bashrc`):

```shell
~/presenter/backend/start.sh
```

## Notes

```json
JWT Payload:
{
    "validUntil": 0,
    "roles": [],
}
```
