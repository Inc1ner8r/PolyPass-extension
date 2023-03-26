import React, {
  ButtonHTMLAttributes,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../../contexts/WalletContext";
import { CollectionRecordResponse } from "@polybase/client";
import { usePolyBase } from "../../hooks/usePolyBase";

const MyPasswords = () => {
  const [AllData, setAllData] = useState<CollectionRecordResponse<any>[]>([]);
  const { get_all_my_records } = usePolyBase();
  const navigateDetails = (id: string) => {
    navigate(`/my-passwords/${id}`);
  };
  const navigate = useNavigate();
  const wallet_context = useContext(WalletContext);

  const check = async () => {
    if (!(await wallet_context.get_wallet())) navigate("/unlock");
  };
  useEffect(() => {
    check();
    const fetchAllData = async () => {
      const response = await get_all_my_records();
      setAllData(response);
    };
    fetchAllData();
  }, [wallet_context]);

  return (
    <>
      <div className="py-5">
        <h1 className="text-2xl font-bold ml-4">PolyPass</h1>

        <hr className="border-gray-300 mx-3" />
      </div>
      {AllData.map((item) => (
        <div className="flex justify-around py-5" key={item.data["id"]}>
          <div>
            <div className="inline-block ml-4">
              <span className="text-lg font-medium">{item.data["url"]}</span>{" "}
              <br />
              <span className="text-gray-700">{item.data["username"]}</span>
            </div>
          </div>

          <button
            className="bg-[#496BE1] text-white w-16 font-medium rounded-3xl"
            onClick={() => navigateDetails(item.data["id"])}
          >
            Fill
          </button>
        </div>
      ))}
    </>
  );
};

export default MyPasswords;
