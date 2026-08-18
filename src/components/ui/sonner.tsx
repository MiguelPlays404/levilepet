import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      duration={1500}
      gap={8}
      offset={16}
      visibleToasts={3}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-black !text-white !border !border-[#F5C000]/40 !shadow-[0_8px_24px_-8px_rgba(245,192,0,0.35)] !rounded-xl !px-3 !py-2 !text-xs !min-h-0 !w-auto !max-w-[320px] backdrop-blur",
          title: "!text-white !text-xs !font-medium",
          description: "!text-white/70 !text-[11px]",
          actionButton: "!bg-[#F5C000] !text-black !text-[11px] !rounded-md !px-2 !py-1",
          cancelButton: "!bg-white/10 !text-white !text-[11px] !rounded-md !px-2 !py-1",
          success: "!border-[#F5C000]/60 [&_[data-icon]]:!text-[#F5C000]",
          error: "!border-red-500/60 [&_[data-icon]]:!text-red-400",
          info: "!border-[#F5C000]/40 [&_[data-icon]]:!text-[#F5C000]",
          warning: "!border-[#F5C000]/60 [&_[data-icon]]:!text-[#F5C000]",
          closeButton: "!bg-black !border-[#F5C000]/40 !text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
