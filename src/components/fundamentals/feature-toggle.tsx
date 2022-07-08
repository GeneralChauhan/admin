import React from "react"
import { FeatureFlagContext } from "../../context/feature-flag"

export type FeatureToggleProps = {
  featureFlag: string
  showOnlyWhenDisabled?: boolean
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({
  featureFlag,
  showOnlyWhenDisabled = false,
  children,
}) => {
  const { featureToggleList } = React.useContext(FeatureFlagContext)

  const showContent = !!featureToggleList[featureFlag] === !showOnlyWhenDisabled
  return showContent ? <>{children}</> : null
}

export default FeatureToggle