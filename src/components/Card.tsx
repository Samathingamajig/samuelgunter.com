import { timeToReadMinutes } from "../utils/timeToReadMinutes";
import Datetime from "./Datetime";
import type { BlogFrontmatter } from "@content/_schemas";

export interface Props {
  href?: string;
  frontmatter: BlogFrontmatter;
  secHeading?: boolean;
  body: string;
}

export default function Card({
  href,
  frontmatter,
  secHeading = true,
  body,
}: Props) {
  const { title, pubDatetime, description } = frontmatter;

  const timeToRead =
    typeof body === "string" ? timeToReadMinutes(body) : undefined;

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
      <Datetime datetime={pubDatetime} />
      {timeToRead && <span className="text-sm">{timeToRead} min read</span>}
      <p>{description}</p>
    </li>
  );
}
