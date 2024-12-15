import { MinusCircle, PlusCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItemProps {
  question: string;
  answer: string;
  className?: string;
}

const FAQItem = ({ question, answer, className }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      className={`shadow-lg rounded-xl bg-white overflow-hidden transition-transform duration-300 hover:shadow-2xl ${className}`}
    >
      <CardContent className="p-0">
        <button
          className="flex justify-between items-center w-full py-6 px-6 text-left transition duration-200 ease-in-out hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-xl font-extrabold text-gray-800">{question}</span>
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="bg-orange-100 rounded-full p-1"
          >
            {isOpen ? (
              <MinusCircle className="h-8 w-8 text-orange-500 dark:text-orange-400" />
            ) : (
              <PlusCircle className="h-8 w-8 text-orange-500 dark:text-orange-400" />
            )}
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 pb-6">
                <p className="leading-relaxed text-gray-600">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

interface FrequentlyAskedQuestionsProps {
  readonly backgroundColor: string;
  readonly className?: string;
}

export default function FrequentlyAskedQuestions({
  backgroundColor,
  className = "",
}: FrequentlyAskedQuestionsProps) {
  return (
    <section
      id="faq"
      className={`py-20 ${backgroundColor} relative ${className}`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <FAQItem
            question="Does Real Sync work in hybrid environments?"
            answer="Yes, Real Sync is specifically designed to integrate seamlessly into hybrid environments, connecting cloud applications and services with local infrastructure. This capability ensures a smooth and efficient experience, regardless of where your systems are located."
          />
          <FAQItem
            question="How are secure tunnels configured in Real Sync?"
            answer="Configuring secure tunnels in Real Sync is a simple and intuitive process. Through our user interface or command line, you can define endpoints, set access rules, and enable encryption. Additionally, we provide predefined templates to accelerate the setup."
          />
          <FAQItem
            question="What are the technical requirements for Real Sync?"
            answer="Real Sync is compatible with most modern environments. It requires a Linux or Windows server, internet access, at least 2 CPU cores, 4 GB of RAM, and 20 GB of storage. It can also integrate with cloud services such as AWS, Google Cloud, or Azure."
          />
          <FAQItem
            question="Does Real Sync replace traditional VPNs?"
            answer="In many cases, yes. Real Sync eliminates the need for traditional VPNs to connect local servers to the cloud or securely access internal services, offering superior flexibility and performance."
          />
          <FAQItem
            question="What kind of technical support does Real Sync offer?"
            answer="Real Sync offers comprehensive support at all stages: planning, implementation, and optimization. We provide support via email, live chat, and phone, as well as a knowledge base and tutorials."
          />
          <FAQItem
            question="Does Real Sync improve network security?"
            answer="Yes, Real Sync implements encrypted tunnels and hides internal services, significantly reducing the risk of unauthorized access. This makes it an ideal solution for protecting critical data."
          />
          <FAQItem
            question="What advantages does Real Sync have over other solutions?"
            answer="Real Sync combines ease of use with advanced capabilities like dynamic load balancing, automatic fallback, and scalability. It's ideal for businesses looking to optimize their connectivity infrastructure."
          />
          <FAQItem
            question="Can Real Sync be customized for specific needs?"
            answer="Yes, Real Sync offers customization options to meet your company's requirements. Our support team can help you implement advanced configurations."
          />
        </div>
      </div>
    </section>
  );
}
