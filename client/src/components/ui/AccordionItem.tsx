import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export default function AccordionItem({
  question,
  answer,
  defaultOpen = false,
}: AccordionItemProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className="border-b border-stone-200 py-4">
          <DisclosureButton className="flex w-full justify-between items-center text-left text-stone-900 font-medium hover:text-amber-600 transition-colors">
            <span>{question}</span>
            <ChevronDownIcon
              className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </DisclosureButton>
          <DisclosurePanel className="pt-2 pb-4 text-stone-500 leading-relaxed">
            {answer}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
}
