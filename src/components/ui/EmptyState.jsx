export function EmptyState({ action, description, icon: Icon, title, titleAs = 'h2' }) {
  const Heading = titleAs
  return (
    <section className="empty-state">
      {Icon ? <Icon aria-hidden="true" size={32} /> : null}
      <div>
        <Heading tabIndex={titleAs === 'h1' ? -1 : undefined}>{title}</Heading>
        <p>{description}</p>
      </div>
      {action}
    </section>
  )
}
