import { useEffect, useState } from "react";
import { Icons } from "./icons";

type DeleteProps = {
  onWalletDelete: () => void;
};

export const Delete = ({ onWalletDelete }: DeleteProps) => {
  const [deleted, setDeleted] = useState(false);

  const deleteElement = () => {
    setDeleted(true);
  };

  useEffect(() => {
    let timer: number | undefined;

    if (deleted) {
      timer = window.setTimeout(() => {
        setDeleted(false);
        onWalletDelete();
      }, 300);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [deleted, onWalletDelete]);

  return (
    <>
      {(deleted && <Icons.success />) || (
        <Icons.delete className="icon-button" onClick={deleteElement} />
      )}
    </>
  );
};
