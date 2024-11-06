import React from "react";
import Link from "next/link";
import { LuTent } from "react-icons/lu";

import { Button } from "../ui/button";

const Logo = () => {
  return (
    <Button size="icon" asChild>
      <Link href="/">
        <LuTent className="!w-7 !h-7" />
      </Link>
    </Button>
  );
};

export default Logo;
