import { useEffect, useState } from "react";
import { Icons } from "./icons";

type CopyProps = {
  text: string;
};

export const Copy = ({ text }: CopyProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  useEffect(() => {
    let timer: number | undefined;

    if (copied) {
      timer = window.setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [copied]);

  return (
    <>
      {(copied && <Icons.success />) || (
        <Icons.copy className="icon-button" onClick={copyToClipboard} />
      )}
    </>
  );
};
