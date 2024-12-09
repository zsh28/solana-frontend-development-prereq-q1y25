interface Href {
  finished: string;
  starter: string;
}

interface Project {
  title: string;
  description: string;
  href: Href;
}

export const projects: Project[] = [
  {
    title: "wallets",
    description:
      "You will use solana/web3.js to implement the Solana wallet adapter in an application.",
    href: {
      finished: "/wallets/finished",
      starter: "/wallets/starter",
    },
  },
  {
    title: "send sol",
    description:
      "You will create an application that allows you to send SOL to another wallet on the Solana devnet.",
    href: {
      finished: "/sendsol/finished",
      starter: "/sendsol/starter",
    },
  },
];
