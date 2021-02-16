import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import {
  exampleClass,
  StudentInformation,
  partitionClass,
  FennelResult,
} from "./fennel";
import { useRosetta } from "./RosettaContext";
import { StudentRow } from "./StudentRow";
import { PARTITION_COLORS } from "./util";

function Result({ result }: { result: FennelResult }) {
  const { t } = useRosetta();
  return (
    <>
      <h3 class="font-bold mb-4">{t("results.headline")}</h3>
      {result.partions.map((group, index) => (
        <>
          <div class={`mt-3`}>
            <span class={`font-bold ${PARTITION_COLORS[index]}`}>
              {t("results.group", { number: index + 1 })}{" "}
            </span>
            <span class="text-sm">
              ({t("results.group_size", { number: group.length })})
            </span>
          </div>
          <div>{group.join(", ")}</div>
        </>
      ))}
      <div className="mt-3">
        {t("results.min_cut_size", {
          minCutSize: result.minCutSize,
        })}
      </div>
    </>
  );
}

const initialData: StudentInformation[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: index + 1,
    contacts: [],
  })
);

export function ClassGrouperApp() {
  const [result, setResult] = useState<FennelResult | null>(null);
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [data, setData] = useState<StudentInformation[]>(initialData);
  const allIds = data.map((student) => student.id);
  const isValid = data.every((student) => {
    return (
      typeof student.id === "number" &&
      student.contacts.every(
        (contact) => typeof contact === "number" && allIds.includes(contact)
      )
    );
  });
  const { t } = useRosetta();

  return (
    <form
      class="mx-auto max-w-screen-xl"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          const result = partitionClass(data, { k: numberOfGroups });
          setResult(result);
        } catch (error) {
          console.error(error);
        }
      }}
    >
      <div class="sticky top-0 flex justify-end items-center bg-white p-4 -mx-4 ">
        <div class="flex">
          {data !== initialData && (
            <button
              type="button"
              class="mr-4 sm:mr-8 text-red-600 hover:text-red-800"
              onClick={() => {
                setResult(null);
                setData(initialData);
              }}
            >
              {t("reset_button")}
            </button>
          )}
          <button
            type="submit"
            class="flex items-center justify-center px-4 sm:px-8 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow disabled:opacity-50"
            disabled={!isValid}
          >
            {t("submit_button")}
          </button>
        </div>
      </div>

      <div class="lg:flex">
        <div class="lg:w-1/3 lg:sticky top-6 self-start">
          <h3 class="font-bold mb-4">{t("class_settings.headline")}</h3>
          <label class="block mb-6">
            <div class="pr-2 text-sm font-medium text-gray-700">
              {t("class_settings.number_of_studens_label")}
            </div>
            <input
              class="w-20 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              type="number"
              value={data.length}
              min={2}
              max={40}
              onInput={(event) => {
                if (event.target instanceof HTMLInputElement) {
                  const newLength = parseInt(event.target.value);

                  if (
                    !Number.isInteger(newLength) ||
                    newLength < parseInt(event.target.min) ||
                    newLength > parseInt(event.target.max)
                  ) {
                    event.target.reportValidity();
                    return;
                  }

                  if (newLength < data.length) {
                    setData(data.slice(0, newLength));
                  } else if (newLength > data.length) {
                    const newData = data.concat(
                      Array.from(
                        { length: newLength - data.length },
                        (v, index) => ({
                          id: data.length + index + 1,
                          contacts: [],
                        })
                      )
                    );
                    setData(newData);
                  }
                }
              }}
            ></input>
          </label>

          <label class="block mb-6">
            <div class="pr-2 text-sm font-medium text-gray-700">
              {t("class_settings.number_of_groups_label")}
            </div>
            <input
              class="w-20 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              type="number"
              value={numberOfGroups}
              min={2}
              max={Math.round(data.length / 2)}
              onInput={(event) => {
                if (event.target instanceof HTMLInputElement) {
                  const newValue = parseInt(event.target.value);
                  if (
                    !Number.isInteger(newValue) ||
                    newValue < parseInt(event.target.min) ||
                    newValue > parseInt(event.target.max)
                  ) {
                    event.target.reportValidity();
                    return;
                  }

                  setNumberOfGroups(newValue);
                }
              }}
            ></input>
          </label>

          {!result && (
            <button
              type="button"
              class="mr-8 font-medium text-indigo-600 hover:text-indigo-900"
              onClick={() => setData(exampleClass)}
            >
              {t("load_sample_data")}
            </button>
          )}

          {result !== null && <Result result={result} />}
        </div>

        <div class="mt-5 lg:mt-0 lg:ml-10 flex-grow lg:w-2/3">
          <h3 class="font-bold mb-4">{t("contact_lists.headline")}</h3>
          <table class="table-fixed min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 rounded-md">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("contact_lists.header_student")}
                </th>
                <th
                  scope="col"
                  class="w-5/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("contact_lists.header_contacts")}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {data.map((student, index) => (
                <StudentRow
                  key={student.id}
                  id={student.id}
                  result={result}
                  contacts={student.contacts}
                  maxStudents={data.length}
                  onChange={(contacts) => {
                    const newData = [...data];
                    newData[index] = {
                      ...newData[index],
                      contacts,
                    };
                    setData(newData);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
