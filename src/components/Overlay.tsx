interface OverlayProps {
  onClose: () => void;
  zIndex?: string;
}

const Overlay = ({ onClose, zIndex = "z-40" }: OverlayProps) => {
  return <div className={`fixed inset-0 bg-black/50 ${zIndex}`} onClick={onClose} aria-hidden="true" />;
};

export default Overlay;
