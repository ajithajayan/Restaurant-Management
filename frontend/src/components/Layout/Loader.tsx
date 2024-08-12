const Loader = () => {
  return (
    <div className="h-screen flex size-full h-screen items-center justify-center gap-3 text-white">
      <img
        src="/icons/loader.svg"
        alt="loader"
        width={32}
        height={32}
        className="animate-spin"
      />
      Loading...
    </div>
  );
};

export default Loader;