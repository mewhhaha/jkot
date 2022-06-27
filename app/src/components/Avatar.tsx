type AvatarProps = {
  href: string;
  user: string;
  image: string;
};

export const Avatar: React.FC<AvatarProps> = ({ href, user, image }) => {
  return (
    <a href={href}>
      <span className="sr-only">{user}</span>
      <img className="h-10 w-10 rounded-full" src={image} alt="avatar" />
    </a>
  );
};
