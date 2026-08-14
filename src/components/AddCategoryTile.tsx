export function AddCategoryTile({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="board-add" onClick={onClick}>
      + new category
    </button>
  );
}
