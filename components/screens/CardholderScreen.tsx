import { TextArea } from "@/components/shared/TextArea";
import { useState } from "react";
import CardholderTapModal from "../modals/CardholderTapModal";
import Modal from "../modals/Modal";
import { Button } from "../ui/button";

export type SignMessageArgs = {
  digest: string;
  rawSignature: {
    r: string;
    s: string;
    v: number;
  };
  publicKey: string;
};

enum CardholderDisplayState {
  CHAT,
  TAP,
  SUBMITTING,
}

export default function CardholderScreen() {
  const [message, setMessage] = useState("");
  const [displayState, setDisplayState] = useState<CardholderDisplayState>(
    CardholderDisplayState.CHAT
  );

  const onCardholderTap = async (args: SignMessageArgs): Promise<void> => {
    setDisplayState(CardholderDisplayState.SUBMITTING);
    await fetch("/api/cardholder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        signature: args.rawSignature,
      }),
    }).then(async (response) => {
      setMessage("");
      setDisplayState(CardholderDisplayState.CHAT);
      if (response.status === 200) {
        alert("Successfully sent chat message!");
      } else {
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        }
        alert("Error sending chat message.");
      }
    });
  };

  const onSubmit = async () => {
    if (!message) {
      alert("Please enter a message.");
      return;
    }

    setDisplayState(CardholderDisplayState.TAP);
  };

  const getDisplayText = () => {
    switch (displayState) {
      case CardholderDisplayState.CHAT:
        return "SEND";
      case CardholderDisplayState.TAP:
        return "TAP";
      case CardholderDisplayState.SUBMITTING:
        return "SENDING MESSAGE...";
    }
  };

  if (displayState === CardholderDisplayState.TAP) {
    return <CardholderTapModal message={message} onTap={onCardholderTap} />;
  }

  return (
    <Modal 
      title="Cardholder Chat"
      description={
        <>
          <span>
            Chat pseudonymously with other Sigmoji holders! Messages will be sent
            to the Sigmoji Telegram group. This chat is only available to Sigmoji
            Cardholders.
          </span>
          <span>
            When you send a chat message, you will be asked to tap your card. This
            will generate a signature that authenticates your message.
          </span>
        </>
      }
    >
      <div className="flex flex-col items-center self-stretch text-center gap-4 p-2">
        <TextArea header="Message" value={message} setValue={setMessage} />
        <Button className="w-full" onClick={onSubmit}>
          {getDisplayText()}
        </Button>
      </div>
    </Modal>
  );
}