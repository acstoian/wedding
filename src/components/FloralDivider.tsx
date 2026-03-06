import Image from "next/image";

export default function FloralDivider() {
  return (
    <div className="flex items-center justify-center overflow-hidden -my-2">
      <Image
        src="/images/floral-top.jpg"
        alt=""
        width={1200}
        height={267}
        className="w-full max-w-4xl h-auto"
      />
    </div>
  );
}
