import React from 'react'
import { Header } from 'src/components/common/layouts/header'
import { Footer } from 'src/components/common/layouts/footer'
import { SEO } from 'src/components/domain/seo'
import IconFilter from 'src/assets/icons/filter.svg'
// import { Filter, useFilter } from 'src/components/common/filter'
import css from './watch.module.scss'
import { PageHero } from 'src/components/common/page-hero'
import { Video } from './playlists'

type WatchProps = {}

export const Watch = (props: WatchProps) => {
  return (
    <div className={css['container']}>
      <SEO />
      <Header />

      <PageHero title="Watch" titleSubtext="Devcon" />

      <div className="section">
        <div className="content">
          <div className={css['search']}>Search</div>
        </div>
      </div>
      <div className="section">
        <div className="content">
          <div className={`${css['content']}`}>
            <div className={css['filter']}>
              <div className={css['header']}>
                <p className="title">Filter</p>
                <button>
                  <IconFilter />
                </button>
              </div>
            </div>

            <div className={css['videos']}>
              <div className={css['header']}>
                <p className="title">Videos</p>
                <button>
                  <IconFilter />
                </button>
              </div>

              <Video />
              <Video />
              <Video />
              <Video />
              <Video />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}