import { redirect } from "next/navigation";

export default async function LearningSubjectSlugPage({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}) {
  const { subjectSlug } = await params;
  redirect(`/subjects/${subjectSlug}`);
}
