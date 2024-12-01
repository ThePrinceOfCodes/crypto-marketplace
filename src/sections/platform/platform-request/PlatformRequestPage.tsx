import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";

import { InputText, Spinner } from "@common/components";
import {
  iGetAllTokensErr,
  iPostAddPlatformTokenErr,
  useGetAllTokens,
  usePostAddPlatformToken,
} from "api/hooks";

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

function PlatformRequestPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const [personName, setPersonName] = useState<string[]>([]);

  const { data: tokenData } = useGetAllTokens(
    {},
    {
      onError: (err: iGetAllTokensErr) => {
        toast(err?.response?.data?.message, { type: "error" });
      },
    },
  );

  const { mutateAsync: addPlatformToken, isLoading } =
    usePostAddPlatformToken();

  const handleSelectChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const platformId: string = router.query.platform as string || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    addPlatformToken({
      platformId,
      tokenName: data.name,
    })
      .then(() => {
        toast("Add new platform successfully", { type: "success" });
      })
      .catch((err: iPostAddPlatformTokenErr) => {
        toast(err?.response?.data?.msg, { type: "error" });
      });
  };

  return (
    <>
      <div className="flex h-full flex-col justify-center items-center px-5 py-10">
        <h1 className="text-4xl mb-5 font-semibold">Platform Request</h1>
        <div className="w-full h-full py-4 px-20 bg-white">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className=" px-20 space-y-6"
            action="#"
            method="POST"
          >
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="-space-y-px rounded-md shadow-sm">
              <InputText
                id="name"
                type="name"
                error={errors.name?.message}
                labelFor="name"
                labelText="Name"
                className="w-80"
                isRequired={true}
                {...register("name", {
                  required: "Name is required",
                })}
                placeholder="Name"
              />
              <InputText
                id="url"
                type="url"
                error={errors.url?.message}
                labelFor="url-address"
                labelText="URL"
                className="w-80"
                isRequired={true}
                {...register("url", {
                  required: "url is required",
                })}
                placeholder="URL"
              />
              <div>
                <FormControl sx={{ width: 600 }}>
                  <label className="block mb-2 mt-4 text-sm font-medium text-gray-900">
                    Select Tokens
                  </label>
                  <Select
                    className="bg-gray-50  text-gray-900 sm:text-xs text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600   "
                    multiple
                    displayEmpty
                    value={personName}
                    onChange={handleSelectChange}
                    inputProps={{ "aria-label": "Without label" }}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <p className="text-gray-400">Select Tokens</p>;
                      }

                      return selected.join(", ");
                    }}
                    MenuProps={MenuProps}
                  >
                    <MenuItem disabled value="">
                      <em>Select Tokens</em>
                    </MenuItem>
                    {tokenData?.allTokensData.map((token) => {
                      const name = token.name;
                      return (
                        <MenuItem
                          className="text-xs text-neutral-500"
                          key={name}
                          value={name}
                        >
                          <Checkbox checked={personName.indexOf(name) > -1} />
                          <ListItemText className="text-xs" primary={name} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div>
              <Link
                href="/platforms"
                className=" mr-3  rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                disabled={isLoading}
                type="submit"
                className="group   rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLoading && <Spinner />} Submit
              </button>
              <div className="text-sm">
                <p className="text-sm font-light mt-3 pt-1 mb-0">
                  * Platform will be accessible once approved by the
                  administrator
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default PlatformRequestPage;
