import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export const MainHeader = () => {
  return (
    <div className="bg-woodsmoke-950 flex w-full h-[120px] pt-8 px-6 pb-2 items-center gap-2 border-b border-b-woodsmoke-800">
      <div className="flex justify-between items-center h-10 flex-1">
        <Link href="/">
          <Image src="/logo.svg" width="40" height="40" alt="Logo" priority />
        </Link>
        <Link href="/collect">
          <Button>COLLECT</Button>
        </Link>
      </div>
    </div>
  );
};

export const SecondaryHeader = () => {
  return (
    <div className="flex flex-col h-[120px] pt-8 px-6 pb-2 items-center gap-2">
      <div className="flex justify-center items-center h-10 flex-1">
        <Image src="/logo.svg" width="40" height="40" alt="Logo" priority />
      </div>
    </div>
  );
};
