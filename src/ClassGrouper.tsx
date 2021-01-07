import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import {
  exampleClass,
  StudentInformation,
  partitionClass,
  FennelResult,
} from "./fennel";
import { StudentRow } from "./StudentRow";
import { PARTITION_COLORS } from "./util";

function Result({ result }: { result: FennelResult }) {
  return (
    <>
      <h3 class="font-bold mb-4">Vorgeschlagene Teilung der Klasse</h3>
      {result.partions.map((group, index) => (
        <>
          <div class={`mt-3 font-bold ${PARTITION_COLORS[index]}`}>
            Gruppe {index + 1}
          </div>
          <div>{group.join(", ")}</div>
        </>
      ))}
      <div className="mt-3">
        Es gibt <strong>{result.minCutSize}</strong> Kontakte zwischen den
        Gruppen.
      </div>
    </>
  );
}

const initialData: StudentInformation[] = Array.from(
  { length: 20 },
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

  return (
    <form
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
      <div class="sticky top-0 flex justify-end items-center bg-white p-4 -mx-4">
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
              Zurücksetzen
            </button>
          )}
          <button
            type="submit"
            class="flex items-center justify-center px-4 sm:px-8 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow disabled:opacity-50"
            disabled={!isValid}
          >
            Teilung berechnen
          </button>
        </div>
      </div>

      <div class="lg:flex">
        <div class="lg:w-1/3 lg:sticky top-6 self-start">
          <h3 class="font-bold mb-4">1. Klasse anlegen</h3>
          <label class="block mb-6">
            <div class="pr-2 text-sm font-medium text-gray-700">
              Wieviele Schüler sind in der Klasse?
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
              In wieviele Gruppen soll die Klasse geteilt werden?
            </div>
            <input
              class="w-20 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              type="number"
              value={numberOfGroups}
              min={2}
              max={Math.round(data.length / 2)}
              onInput={(event) => {
                if (event.target instanceof HTMLInputElement) {
                  const newValue = parseInt(event.target.value)
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
              class="mr-8 font-medium text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setData(exampleClass)}
            >
              Mit Beispieldaten ausprobieren
            </button>
          )}

          {result !== null && <Result result={result} />}
        </div>

        <div class="mt-5 lg:mt-0 lg:ml-10 flex-grow lg:w-2/3">
          <h3 class="font-bold mb-4">2. Schüler eintragen</h3>
          <table class="table-fixed min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 rounded-md ">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Schüler
                </th>
                <th
                  scope="col"
                  class="w-5/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kontakte
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
