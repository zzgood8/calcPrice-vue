import http from '../utils/axios'

export function getAllCategory() {
  return http({
    url: '/purchase/priceCategory'
  })
}

export function getPriceRulesByCategory(category: string) {
  return http({
    url: '/purchase/priceRules',
    params: {
      category: category
    }
  })
}

export interface PriceRule {
  name: string
  category: string
  formula: string
}

export function updateOrSave(priceRule: PriceRule) {
  return http({
    url: '/purchase/updateOrSave',
    method: 'post',
    data: priceRule
  })
}

export function uploadUrl() {
  // return http.getUri() + '/purchase'
  return 'http://localhost:9001/purchase'
}
