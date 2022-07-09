import { PencilIcon } from "@heroicons/react/outline";
import { Form, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Textarea, Textbox } from "~/components/form";
import { Modal } from "~/components/Modal";
import { requireAuthentication } from "~/services/auth.server";
import { fields } from "~/services/form.server";
import { item } from "~/services/settings.server";
import { videoKeys } from "~/services/video.server";
import type { VideoSettings } from "~/types";

type LoaderData = {
  clip: VideoSettings;
};

export const loader: LoaderFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context, params: { id } }): Promise<LoaderData> => {
      if (id === undefined) {
        throw new Error("Invariant violated");
      }

      const settings = item(request, context, `video/${id}`);
      const video = await settings.json();

      if (video.id === undefined || video.created === undefined)
        throw new Response("Video not found", { status: 404 });

      return { clip: video };
    }
  );

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ context, request, params: { id } }) => {
    if (id === undefined) {
      throw new Error("Invariant violated");
    }

    const formData: FormData = await request.formData();
    const form = fields(formData, ["title", "description"]);

    const settings = item(request, context, `video/${id}`);
    const video = await settings.json();

    if (video.id === undefined || video.created === undefined)
      throw new Response("Video not found", { status: 404 });

    const { dateKey } = videoKeys({ date: new Date(video.created), id });

    const cache = context.VIDEO_KV.get(dateKey, "json");

    await Promise.all([
      context.VIDEO_KV.put(dateKey, JSON.stringify({ ...cache, ...form })),
      settings.put({ ...video, ...form }),
    ]);

    return redirect("/admin/clips");
  });

export default function Edit() {
  const { clip } = useLoaderData<LoaderData>();
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("/admin/clips", { replace: true });
  }, [navigate]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <Form method="post">
        <Modal.Warning
          title="Edit video"
          icon={
            <PencilIcon
              className="h-6 w-6 text-yellow-600"
              aria-hidden="true"
            />
          }
        >
          <span className="flex w-full flex-col">
            <Textbox label="Title" defaultValue={clip.title} name="title" />
            <Textarea
              label="Description"
              description="Write a short description of the clip."
              name="description"
              defaultValue={clip.description}
            />
          </span>
        </Modal.Warning>
        <Modal.CancelAccept ref={ref} onCancel={handleClose}>
          Save
        </Modal.CancelAccept>
      </Form>
    </Modal>
  );
}
