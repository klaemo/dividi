import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import {
  exampleClass,
  StudentInformation,
  partitionClass,
  FennelResult,
} from "./fennel";

function Result({ result }: { result: FennelResult }) {
  return (
    <>
      {result.partions.map((group, index) => (
        <>
          <div class="mt-3 font-bold">Gruppe {index + 1}</div>
          <div>{group.join(', ')}</div>
        </>
      ))}
    </>
  );
}

function Student({ id, contacts }: { id: number; contacts: number[] }) {
  return (
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        {/* <input class="w-12" type="number" min="0" required value={id} /> */}
        {id}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        {contacts.map((contact, index) => (
          <input
            class="w-12"
            key={index}
            type="number"
            min="0"
            required
            value={contact}
          />
        ))}
        <input class="w-12" key="next" type="number" min="0" />
      </td>
    </tr>
  );
}

const initialData = [{ id: 1, contacts: [] }];

function ClassGrouper({
  setResult,
}: {
  setResult: (result: FennelResult | null) => void;
}) {
  const [data, setData] = useState<StudentInformation[]>(initialData);
  const isValid = data.every(
    (student) =>
      typeof student.id === "number" &&
      student.contacts.every((contact) => typeof contact === "number")
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.time("running fennel");
        const result = partitionClass(data);
        // Some example output
        console.log("Groups:");
        console.log(result.partions);
        console.log("Number of crossing contacts:");
        console.log(result.minCutSize);
        console.timeEnd("running fennel");
        setResult(result);
      }}
    >
      <div class="shadow overflow-hidden border-b border-gray-200 rounded-md mt-5">
        <table class="table-fixed min-w-full divide-y divide-gray-200">
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
              <Student
                key={index}
                id={student.id}
                contacts={student.contacts}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div class="flex justify-end mt-3">
        <button
          type="button"
          class="mr-8"
          onClick={() => setData(exampleClass)}
        >
          Beispieldaten laden
        </button>
        <button
          type="button"
          class="mr-8 text-red-600 hover:text-red-800"
          onClick={() => {
            setResult(null);
            setData(initialData);
          }}
        >
          Zurücksetzen
        </button>
        <button
          type="submit"
          class="flex items-center justify-center px-8 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow disabled:opacity-50"
          disabled={!isValid}
        >
          Teilung ausführen
        </button>
      </div>
    </form>
  );
}

export function ClassGrouperApp() {
  const [result, setResult] = useState<FennelResult | null>(null);

  if (result === null) {
    return <ClassGrouper setResult={setResult} />;
  }

  return <Result result={result} />;
}
