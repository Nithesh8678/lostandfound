// "use client";

// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { LayoutDashboard } from "lucide-react";

// export function Navbar() {
//   return (
//     <motion.div
//       className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl"
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ type: "spring", stiffness: 300, damping: 30 }}
//     >
//       <div className="container flex h-16 items-center px-4 relative">
//         <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10" />
//         <div className="mr-4 hidden md:flex relative">
//           <Link href="/" className="mr-6 flex items-center space-x-2">
//             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
//               Reclaim
//             </span>
//           </Link>
//           <nav className="flex items-center space-x-6 text-sm font-medium">
//             <Link
//               href="/about"
//               className="transition-colors hover:text-primary"
//             >
//               About
//             </Link>
//             <Link
//               href="/how-it-works"
//               className="transition-colors hover:text-primary"
//             >
//               How it Works
//             </Link>
//           </nav>
//         </div>
//         <div className="flex flex-1 items-center justify-end space-x-4">
//           <ConnectButton.Custom>
//             {({
//               account,
//               chain,
//               openAccountModal,
//               openChainModal,
//               openConnectModal,
//               mounted,
//             }) => {
//               const ready = mounted;
//               const connected = ready && account && chain;

//               return (
//                 <div
//                   {...(!ready && {
//                     "aria-hidden": true,
//                     style: {
//                       opacity: 0,
//                       pointerEvents: "none",
//                       userSelect: "none",
//                     },
//                   })}
//                   className="flex items-center gap-2"
//                 >
//                   {(() => {
//                     if (!connected) {
//                       return (
//                         <Button
//                           onClick={openConnectModal}
//                           className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
//                         >
//                           Connect Wallet
//                         </Button>
//                       );
//                     }

//                     return (
//                       <>
//                         <Link href="/dashboard">
//                           <Button
//                             variant="outline"
//                             className="gap-2 border-primary/20 hover:border-primary/40"
//                           >
//                             <LayoutDashboard className="h-4 w-4" />
//                             Dashboard
//                           </Button>
//                         </Link>
//                         <Button
//                           onClick={openChainModal}
//                           variant="outline"
//                           className="border-primary/20 hover:border-primary/40"
//                         >
//                           {chain.hasIcon && (
//                             <div className="mr-2">
//                               {chain.iconUrl && (
//                                 <img
//                                   alt={chain.name ?? "Chain icon"}
//                                   src={chain.iconUrl}
//                                   className="h-4 w-4"
//                                 />
//                               )}
//                             </div>
//                           )}
//                           {chain.name}
//                         </Button>
//                         <Button
//                           onClick={openAccountModal}
//                           className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
//                         >
//                           {account.displayName}
//                         </Button>
//                       </>
//                     );
//                   })()}
//                 </div>
//               );
//             }}
//           </ConnectButton.Custom>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
