#!/usr/bin/env python3

from pathlib import Path
import subprocess
import sys

KEY_DIR = Path("/app/keys")
PRIVATE_KEY = KEY_DIR / "private_key.pem"
PUBLIC_KEY = KEY_DIR / "public_key.pem"


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> int:
    if not PRIVATE_KEY.is_file():
        print("Generating new PID Provider keys")
        KEY_DIR.mkdir(parents=True, exist_ok=True)

        run([
            "openssl", "ecparam",
            "-name", "prime256v1",
            "-genkey",
            "-noout",
            "-out", str(PRIVATE_KEY),
        ])

        run([
            "openssl", "ec",
            "-in", str(PRIVATE_KEY),
            "-pubout",
            "-out", str(PUBLIC_KEY),
        ])
    else:
        print("PID provider keys already exist")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
