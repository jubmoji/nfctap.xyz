"use client";

import { OuterContainer, InnerContainer } from "../shared/Modal";
import Modal from "./Modal";
import { PrimaryFontBase, PrimaryFontH3 } from "../core";
import { execHaloCmdWeb } from "@arx-research/libhalo/api/web.js";
import { recoverPublicKey } from "@arx-research/libhalo/halo/utils.js";
import { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import { HaLoNoncePCDArgs } from "@pcd/halo-nonce-pcd";
import { ArgumentTypeName } from "@pcd/pcd-types";
import CollectedModal from "./CollectedModal";
import { cardPubKeys } from "@/lib/cardPubKeys";
import { PrimaryLargeButton } from "../shared/Buttons";

export default function TapModal() {
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [statusText, setStatusText] = useState("Waiting for NFC setup...");
  const [args, setArgs] = useState<HaLoNoncePCDArgs | undefined>(undefined);

  // run code as soon as modal is rendered
  useEffect(() => {
    async function runScan() {
      let command = {
        name: "sign_random",
        keyNo: 2,
      };

      let res;
      try {
        // --- request NFC command execution ---
        res = await execHaloCmdWeb(command, {
          statusCallback: (cause: any) => {
            if (cause === "init") {
              setStatusText(
                "Please tap the tag to the back of your smartphone and hold it..."
              );
            } else if (cause === "retry") {
              setStatusText(
                "Something went wrong, please try to tap the tag again..."
              );
            } else if (cause === "scanned") {
              setStatusText(
                "Tag scanned successfully, post-processing the result..."
              );
            } else {
              setStatusText(cause);
            }
          },
        });
        // the command has succeeded, display the result to the user
        setStatusText(res.nonce + "/n" + res.digest + "/n" + res.signature);

        // parsing DER
        const rndBuf = Buffer.from(res.digest, "hex");
        const hash = sha256.create();
        const rndHashed = hash
          .update(
            Buffer.concat([
              Buffer.from([0x19]),
              Buffer.from("Attest counter pk2:\n", "utf8"),
            ])
          )
          .update(rndBuf)
          .hex();

        const sigmojiPubkeys = recoverPublicKey(rndHashed, res.signature);
        let realPubkey = undefined;

        // there are two returned pubkeys because of ECDSA bullshit. need to
        // pick the one that is actually a pubkey of the cards
        for (const entry of Object.entries(cardPubKeys)) {
          if (
            entry[1].secondaryPublicKeyRaw.toLowerCase() ===
            sigmojiPubkeys[0].toLowerCase()
          ) {
            realPubkey = sigmojiPubkeys[0];
          } else if (
            entry[1].secondaryPublicKeyRaw.toLowerCase() ===
            sigmojiPubkeys[1].toLowerCase()
          ) {
            realPubkey = sigmojiPubkeys[1];
          }
        }

        if (realPubkey === undefined) {
          setStatusText(
            "Couldn't find the card's public key in the list of known cards. Please contact organizers."
          );
          return;
        }

        setArgs({
          pk2: {
            argumentType: ArgumentTypeName.String,
            value: realPubkey,
          },
          rnd: {
            argumentType: ArgumentTypeName.String,
            value: res.digest,
          },
          rndsig: {
            argumentType: ArgumentTypeName.String,
            value: res.signature,
          },
        });
      } catch (e) {
        // the command has failed, display error to the user
        // "Scanning failed, reload to retry. Details: " + String(e)
        setStatusText("Scanning failed, reload page to retry.");
      }
    }

    if (isTapping) {
      runScan();
    }
  }, [isTapping]);

  if (args) {
    return <CollectedModal args={args} />;
  }

  return isTapping ? (
    <Modal>
      <OuterContainer>
        <InnerContainer>
          <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
            Place the NFC card on your phone.
          </PrimaryFontH3>
          <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
            {statusText}
          </PrimaryFontBase>
          <PrimaryFontBase style={{ color: "var(--woodsmoke-100)" }}>
            {"If you still can't tap, check out the "}
            <a
              href="https://pse-team.notion.site/Card-tapping-instructions-ac5cae2f72e34155ba67d8a251b2857c?pvs=4"
              target="_blank"
              style={{ textDecoration: "underline" }}
            >
              troubleshooting guide
            </a>
            .
          </PrimaryFontBase>
        </InnerContainer>
      </OuterContainer>
      <img
        src="/phone-tap.gif"
        style={{ marginTop: "40px", marginBottom: "40px" }}
      />
    </Modal>
  ) : (
    <Modal>
      <OuterContainer>
        <InnerContainer>
          <PrimaryFontH3 style={{ color: "var(--woodsmoke-100)" }}>
            Press the button below to begin tapping!
          </PrimaryFontH3>
          <PrimaryLargeButton onClick={() => setIsTapping(true)}>
            Tap!
          </PrimaryLargeButton>
        </InnerContainer>
      </OuterContainer>
    </Modal>
  );
}
