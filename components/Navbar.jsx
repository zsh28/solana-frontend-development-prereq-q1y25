import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration errors
const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

const Navbar = () => {
  return (
    <nav className="p-4 flex justify-between items-center bg-zinc-800">
      <a href="/">
        <div className="relative">
          <img
            src="/turbine-logo-text.svg"
            width="200"
            className="transition-transform duration-200 transform hover:scale-100 hover:cursor-pointer"
            alt="Helius logo"
          />
        </div>
      </a>

      {/* Make sure you have a valid component name after the < */}
      <WalletMultiButtonDynamic
        className="!bg-turbine-green hover:!bg-black transition-all duration-200 !rounded-lg"
      />
    </nav>
  );
};

export default Navbar;
