"use client";

import { useEffect, useState } from "react";
import { PrimaryFontH3, PrimaryFontBase1 } from "../core";
import { PrimaryLargeButton } from "../shared/Buttons";
import { OuterContainer, InnerContainer } from "../shared/Modal";
import Modal from "./Modal";
import { ProverWasm, initWasm, makeProofs } from "@/lib/zkProving";

export default function ProvingModal() {
  const [wasm, setWasm] = useState<ProverWasm>();

  useEffect(() => {
    async function setup() {
      if (!wasm) {
        setWasm(await initWasm());
      }
    }

    setup();
  });

  return (
    <Modal>
      <OuterContainer>
        <InnerContainer>
          <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
            Your score
          </PrimaryFontH3>
          <PrimaryLargeButton onClick={() => (wasm ? makeProofs(wasm) : {})}>
            <PrimaryFontBase1>
              {wasm ? "PROVE IT!" : "Loading.."}
            </PrimaryFontBase1>
          </PrimaryLargeButton>
        </InnerContainer>
      </OuterContainer>
    </Modal>
  );
}
