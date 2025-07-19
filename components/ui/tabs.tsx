import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion';

interface TabsContextType {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);
  // Separate tab triggers and tab contents
  const triggers: React.ReactNode[] = [];
  const contents: React.ReactElement[] = [];
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      // Fix for React component identity: compare type.name or type.displayName
      const type = child.type as any;
      if (type === TabsContent || type?.name === 'TabsContent' || type?.displayName === 'TabsContent') {
        contents.push(child as React.ReactElement);
      } else {
        triggers.push(child);
      }
    }
  });
  const activeContent = contents.find(c => c.props.value === value);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("tabs", className)}>
        {triggers}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeContent && (
              <motion.div
                key={activeContent.props.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn("tabs-content p-0 bg-transparent text-white", activeContent.props.className)}
                style={{ borderRadius: 0 }}
              >
                {activeContent.props.children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={cn(
        "tabs-list flex border-b border-zinc-800 bg-transparent px-2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  const isActive = ctx.value === value;
  return (
    <button
      className={cn(
        "tabs-trigger flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150 bg-transparent relative border-b-0",
        isActive
          ? "text-white"
          : "text-zinc-400 hover:text-white",
        className
      )}
      onClick={() => ctx.setValue(value)}
      type="button"
      style={{ background: "none", boxShadow: "none" }}
    >
      {children}
      {isActive && (
        <span
          className="absolute left-0 bottom-0 h-0.5 w-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #a259ec 0%, #f24e1e 100%)"
          }}
        />
      )}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  // Only used for props extraction, rendering is handled in Tabs
  return null;
}
TabsContent.displayName = 'TabsContent';
