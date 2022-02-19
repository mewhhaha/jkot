import { Stream } from "@cloudflare/stream-react";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <div className="flex w-full flex-col items-center px-0 pt-0 sm:px-12 sm:pt-12">
        <div className="z-10 h-full max-h-[1024px] w-full max-w-[1920px] rounded bg-black p-2">
          <Stream
            className="aspect-video h-full w-full bg-black"
            controls
            loop
            title={profile.stream.title}
            poster={profile.images.poster.src}
            muted
            autoplay
            primaryColor="aquamarine"
            src={profile.stream.id}
          />
        </div>
        <dl className="z-10 w-full max-w-[1920px] pt-2 pl-2 text-white sm:pl-0">
          <dt className="sr-only">Name</dt>
          <dd className="text-xl font-semibold">{profile.name}</dd>
          <dt className="sr-only">Stream Title</dt>
          <dd className="text-lg font-semibold">{profile.stream.title}</dd>
          <dt className="sr-only">Category</dt>
          <dd>{profile.stream.category}</dd>
        </dl>
      </div>
    </div>
  );
}
