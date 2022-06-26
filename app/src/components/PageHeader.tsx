type PageHeaderProps = { about: string; title: string };

export const PageHeader: React.FC<PageHeaderProps> = ({ about, title }) => {
  return (
    <header className="relative hidden w-full flex-col bg-white sm:flex">
      <div className="relative mx-auto max-w-7xl py-16 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-['Cookie Monster'] flex justify-center text-base font-bold uppercase tracking-wide">
            <span className="mt-1 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl sm:tracking-tight lg:text-6xl">
              {title}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-gray-500">{about}</p>
        </div>
      </div>
    </header>
  );
};
