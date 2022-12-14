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

export function deletePriceRules(id: number) {
  return http({
    url: '/purchase/delete',
    method: 'post',
    data: id
  })
}

export function uploadUrl() {
  return http.getUri() + '/purchase'
}
