import React, { useState } from 'react'
import { PageContent, Page } from 'src/components/layouts/horizontal-layout'
import { useIntl } from 'gatsby-plugin-intl'
import css from './learn.module.scss'
import { ArchiveOverview } from 'src/components/archive-overview'
import { Filter } from 'src/components/archive-overview/filter'

export const Learn = React.forwardRef((props: any, ref) => {
  const intl = useIntl()
  const [filter, setFilter] = useState('')

  return (
    <Page {...props} ref={ref}>
      <div className={css['background']}></div>

      <PageContent
        backgroundText={intl.formatMessage({ id: 'rtd_educational_resources' })}
        links={[{ url: 'https://ethereum.org', title: 'Ethereum.org', icon: 'web' }]}
        bottomLinks={[{ url: 'https://archive.devcon.org', title: 'Devcon Archive' }]}
      >
        <div className={css['container']}>
          <div className={css['header']}>
            <h3 className="subsection-header">Archive</h3>
            <Filter onFilter={e => setFilter(e)} />
          </div>
          <div className={css['content']}>
            <ArchiveOverview
              videos={props.videos}
              defaultVideo={'https://www.youtube.com/embed/wNCKJtGuL5g'}
              filter={filter}
            />
          </div>
        </div>
      </PageContent>
    </Page>
  )
})