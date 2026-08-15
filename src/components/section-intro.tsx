import {
  cn,
  sectionDescriptionClassName,
  sectionHeaderClassName,
  sectionTitleClassName,
} from "@/lib/utils";

type SectionIntroProps = {
  title: string;
  description?: React.ReactNode;
  className?: string;
  titleAs?: "h2" | "h3";
};

export function SectionIntro({
  title,
  description,
  className,
  titleAs: Title = "h2",
}: SectionIntroProps) {
  return (
    <div className={cn(sectionHeaderClassName, className)}>
      <Title className={sectionTitleClassName}>{title}</Title>
      {description ? (
        <p className={sectionDescriptionClassName}>{description}</p>
      ) : null}
    </div>
  );
}
