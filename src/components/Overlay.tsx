const Overlay = ({ setShowTimeModal }: { setShowTimeModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div className="fixed w-dvw h-dvh bg-black opacity-50" onClick={() => setShowTimeModal(false)}>
      {}
    </div>
  );
};
export default Overlay;
