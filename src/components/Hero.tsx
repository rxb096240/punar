import { useData } from '../context/DataContext';
import { Icon } from './icons';

export function Hero() {
  const { nextUp } = useData();

  return (
    <div className="hero">
      <p className="label">Up next</p>
      <p className="big">
        {!nextUp ? (
          '—'
        ) : nextUp.days < 0 ? (
          <>
            {Math.abs(nextUp.days)}
            <span> days overdue</span>
          </>
        ) : nextUp.days === 0 ? (
          'today'
        ) : (
          <>
            {nextUp.days}
            <span> days</span>
          </>
        )}
      </p>
      <p className="what">
        {nextUp ? (
          <>
            <Icon name={nextUp.icon} size={15} />
            {nextUp.label}
          </>
        ) : (
          'nothing tracked yet'
        )}
      </p>
    </div>
  );
}
