import React from 'react';
import ContentLoader from 'react-content-loader'

export const ImageLoader = props => (
  <ContentLoader
    height={175}
    width={400}
    speed={1}
    primaryColor="#ededed"
    secondaryColor="#f2f2f2"
    {...props}
  >
    <rect x="0" y="0" rx="5" ry="5" width="400" height="175" />
  </ContentLoader>
)

export const CaseDetailsLoader = props => (
  <ContentLoader
    height={160}
    width={400}
    speed={1}
    primaryColor="#ededed"
    secondaryColor="#f2f2f2"
    {...props}
  >
    <circle cx="10" cy="25" r="8" />
    <rect x="25" y="15" rx="5" ry="5" width="400" height="20" />
    <circle cx="10" cy="65" r="8" />
    <rect x="25" y="55" rx="5" ry="5" width="400" height="20" />
    <circle cx="10" cy="105" r="8" />
    <rect x="25" y="95" rx="5" ry="5" width="400" height="20" />
    <circle cx="10" cy="145" r="8" />
    <rect x="25" y="135" rx="5" ry="5" width="400" height="20" />
  </ContentLoader>
)
