type ArticListProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export const CardList: React.FC<ArticListProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <section className="relative w-full bg-gray-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="absolute inset-0">
        <div className="h-1/3 bg-white sm:h-2/3" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
            {description}
          </p>
        </div>
        <ul className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
          {children}
        </ul>
      </div>
    </section>
  );
};
