with import <nixpkgs> {};

let
  unstable = import
    (builtins.fetchTarball "https://github.com/NixOS/nixpkgs/archive/8001cc402f61b8fd6516913a57ec94382455f5e5.tar.gz")
    { config = config; };
in
pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
		nodejs
		typescript
		nodePackages_latest.typescript-language-server
  ];
}


