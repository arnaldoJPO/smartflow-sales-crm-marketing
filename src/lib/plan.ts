export type PlanName = 'basico' | 'intermediario' | 'premium';

export interface PlanLimits {
  maxUsers: number | 'unlimited';
  features: {
    facebookAnalytics: boolean;
    basicAutomations: boolean;
    advancedAutomations: boolean;
    apiAccess: boolean;
  };
}

export function getPlanLimits(plan: string | undefined): PlanLimits {
  const p = (plan || '').toLowerCase();
  switch (p as PlanName) {
    case 'basico':
      return {
        maxUsers: 1,
        features: {
          facebookAnalytics: false,
          basicAutomations: false,
          advancedAutomations: false,
          apiAccess: false,
        },
      };
    case 'intermediario':
      return {
        maxUsers: 3,
        features: {
          facebookAnalytics: true,
          basicAutomations: true,
          advancedAutomations: false,
          apiAccess: false,
        },
      };
    case 'premium':
    default:
      return {
        maxUsers: 'unlimited',
        features: {
          facebookAnalytics: true,
          basicAutomations: true,
          advancedAutomations: true,
          apiAccess: true,
        },
      };
  }
} 