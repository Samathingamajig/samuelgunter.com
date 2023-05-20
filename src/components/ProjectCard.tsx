import Datetime from "./Datetime";

export interface Props {
  href: string;
  title: string;
  description: string;
  pubDatetime: string | Date;
  secHeading?: boolean;
}

export default function Card({
  href,
  title,
  description,
  pubDatetime,
  secHeading = true,
}: Props) {
  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h2>
        ) : (
          <h3 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h3>
        )}
      </a>
      <Datetime datetime={pubDatetime} includeTime={false} />
      <p>{description}</p>
    </li>
  );
}
