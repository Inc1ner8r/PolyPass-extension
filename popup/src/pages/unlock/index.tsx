import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLinkClickHandler } from "react-router-dom";
import { WalletContext } from "../../contexts/WalletContext";
import { wallet_exist } from "../../wallet/wallet";
import { Icon } from "@iconify/react";

const Unlock = () => {
  const [password, set_password] = useState("");
  const navigate = useNavigate();
  const wallet_context = useContext(WalletContext);

  const go_to_my_pass = () => navigate("/my-passwords");
  useEffect(() => {
    if (!wallet_exist()) navigate("/create");
    if (wallet_context.wallet) {
      navigate("/my-passwords");
    }
  }, []);
  const on_unlock = async () => {
    wallet_context.unlock(password).then(go_to_my_pass);
  };
  return (
    <div className="h-96 flex">
      <div className="mx-auto w-9/12 m-auto">
        <Icon
          icon="material-symbols:lock"
          className="text-gray-400 text-4xl mb-1"
        />
        <p className=" mb-2">Wallet Is Locked</p>
        <input
          className="bg-gray-300 mt-1 rounded-md py-1 px-2 w-full text-black placeholder-black"
          type="password"
          placeholder="Password"
          onChange={(e) => set_password(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white mt-2 w-full rounded-md"
          onClick={on_unlock}
        >
          Unlock
        </button>
      </div>
    </div>
  );
};

export default Unlock;
