/**
 * Trafft API Service
 * Handles integration with College Master Mind's Trafft booking platform
 * API Documentation: https://documenter.getpostman.com/view/1487056/2sAY4x9MRe#0c199a78-54c7-4706-a2bb-b14e39376ac2
 */

const TRAFFT_CONFIG = {
  // Use Process.env.TRAFFT_BASE_URL
  baseUrl: process.env.TRAFFT_BASE_URL,
  // Use Process.env.TRAFFT_CLIENT_ID
  clientId: process.env.TRAFFT_CLIENT_ID,
  // Use Process.env.TRAFFT_CLIENT_SECRET
  clientSecret: process.env.TRAFFT_CLIENT_SECRET
}

/**
 * Format phone number for Trafft API
 * Converts various phone formats to the format Trafft expects: +1 (XXX) XXX-XXXX
 * 
 * Examples:
 * - "6508546574" -> "+1 (650) 854-6574"
 * - "(650) 854-6574" -> "+1 (650) 854-6574"
 * - "16508546574" -> "+1 (650) 854-6574"
 * - "+1 650 854 6574" -> "+1 (650) 854-6574"
 * 
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneForTrafft(phoneNumber) {
  if (!phoneNumber) return ''
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Handle different digit lengths
  if (digits.length === 10) {
    // US number without country code: 6508546574 -> +1 (650) 854-6574
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US number with country code: 16508546574 -> +1 (650) 854-6574
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  } else if (digits.length === 11) {
    // Other country code: assume format +X (XXX) XXX-XXXX
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  } else {
    // For other formats, try to add +1 and format as US number
    console.warn('Unusual phone number format:', phoneNumber, 'digits:', digits)
    if (digits.length >= 10) {
      const last10 = digits.slice(-10)
      return `+1 (${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`
    }
    // If we can't format it properly, return with +1 prefix
    return `+1 ${phoneNumber}`
  }
}

/**
 * Get OAuth token for Trafft API authentication
 */
async function getTraffTToken() {
  try {
    console.log('Attempting to get Trafft token from:', `${TRAFFT_CONFIG.baseUrl}/api/v2/token`)
    
    const response = await fetch(`${TRAFFT_CONFIG.baseUrl}/api/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: TRAFFT_CONFIG.clientId,
        client_secret: TRAFFT_CONFIG.clientSecret
      })
    })

    console.log('Token response status:', response.status)
    console.log('Token response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const responseText = await response.text()
      console.error('Token request failed. Response:', responseText)
      throw new Error(`Failed to get Trafft token: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 200)}`)
    }

    const responseText = await response.text()
    console.log('Token response body:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse token response as JSON:', responseText.substring(0, 200))
      throw new Error(`Invalid JSON response from token endpoint: ${responseText.substring(0, 200)}`)
    }
    
    if (!data.access_token) {
      console.error('No access_token in response:', data)
      throw new Error('No access_token returned from OAuth endpoint')
    }
    
    return data.access_token
  } catch (error) {
    console.error('Error getting Trafft token:', error)
    throw error
  }
}

/**
 * Create a customer in Trafft platform
 * @param {Object} customerData - Customer information
 * @param {string} customerData.firstName - Customer's first name
 * @param {string} customerData.lastName - Customer's last name
 * @param {string} customerData.email - Customer's email address
 * @param {string} customerData.phone - Customer's phone number
 * @returns {Promise<Object>} Created customer data from Trafft
 */
export async function createTraffTCustomer(customerData) {
  try {
    console.log('Creating Trafft customer for:', customerData.email)
    
    // Get authentication token
    const token = await getTraffTToken()
    
    // Format phone number for Trafft API
    const formattedPhone = formatPhoneForTrafft(customerData.phone)
    console.log('Original phone:', customerData.phone, '-> Formatted for Trafft:', formattedPhone)
    
    // Prepare customer data for Trafft API
    const trafftCustomerData = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: formattedPhone,
      description: '1550plus' // Always set to 1550plus as requested
    }

    // Create customer in Trafft
    console.log('Creating customer with data:', trafftCustomerData)
    const response = await fetch(`${TRAFFT_CONFIG.baseUrl}/api/v2/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(trafftCustomerData)
    })

    console.log('Customer creation response status:', response.status)
    console.log('Customer creation response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Trafft customer creation error response:', errorText)
      throw new Error(`Failed to create Trafft customer: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 200)}`)
    }

    const responseText = await response.text()
    console.log('Customer creation response body:', responseText)
    
    let createdCustomer
    try {
      createdCustomer = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse customer creation response as JSON:', responseText.substring(0, 200))
      throw new Error(`Invalid JSON response from customer creation: ${responseText.substring(0, 200)}`)
    }
    
    console.log('Successfully created Trafft customer:', createdCustomer.id || createdCustomer)
    
    return {
      success: true,
      trafftCustomerId: createdCustomer.id,
      trafftCustomerData: createdCustomer
    }
  } catch (error) {
    console.error('Error creating Trafft customer:', error)
    
    // Return error info but don't throw - we don't want Trafft failures to break registration
    return {
      success: false,
      error: error.message,
      trafftCustomerId: null
    }
  }
}

/**
 * Get list of customers from Trafft platform
 * @param {Object} filters - Filter options
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Number of results per page (default: 50)
 * @param {string} filters.email - Filter by email
 * @returns {Promise<Object>} Customer list data
 */
export async function getTraffTCustomers(filters = {}) {
  try {
    console.log('Fetching Trafft customers with filters:', filters)
    
    // Get authentication token
    const token = await getTraffTToken()
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 50,
      ...(filters.email && { email: filters.email }),
      ...(filters.firstName && { firstName: filters.firstName }),
      ...(filters.lastName && { lastName: filters.lastName }),
      ...(filters.phoneNumber && { phoneNumber: filters.phoneNumber })
    })

    const response = await fetch(`${TRAFFT_CONFIG.baseUrl}/api/v2/customers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Trafft customers fetch error:', errorText)
      throw new Error(`Failed to fetch Trafft customers: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched Trafft customers:', data.data?.length || 0, 'customers')
    
    return {
      success: true,
      customers: data.data || [],
      pagination: {
        currentPage: data.current_page || 1,
        totalPages: data.last_page || 1,
        total: data.total || 0,
        perPage: data.per_page || 50
      }
    }
  } catch (error) {
    console.error('Error fetching Trafft customers:', error)
    return {
      success: false,
      error: error.message,
      customers: [],
      pagination: null
    }
  }
}

/**
 * Get list of appointments from Trafft platform
 * @param {Object} filters - Filter options
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Number of results per page (default: 50)
 * @param {string} filters.customerId - Filter by customer ID
 * @param {string} filters.status - Filter by appointment status
 * @returns {Promise<Object>} Appointment list data
 */
export async function getTraffTAppointments(filters = {}) {
  try {
    console.log('Fetching Trafft appointments with filters:', filters)
    
    // Get authentication token
    const token = await getTraffTToken()
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 50,
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.employeeId && { employeeId: filters.employeeId }),
      ...(filters.serviceId && { serviceId: filters.serviceId }),
      ...(filters.locationId && { locationId: filters.locationId }),
      ...(filters.status && { status: filters.status })
    })

    const response = await fetch(`${TRAFFT_CONFIG.baseUrl}/api/v2/appointments?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Trafft appointments fetch error:', errorText)
      throw new Error(`Failed to fetch Trafft appointments: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched Trafft appointments:', data.data?.length || 0, 'appointments')
    
    return {
      success: true,
      appointments: data.data || [],
      pagination: {
        currentPage: data.current_page || 1,
        totalPages: data.last_page || 1,
        total: data.total || 0,
        perPage: data.per_page || 50
      }
    }
  } catch (error) {
    console.error('Error fetching Trafft appointments:', error)
    return {
      success: false,
      error: error.message,
      appointments: [],
      pagination: null
    }
  }
}

/**
 * Update student record with Trafft customer ID
 * @param {string} studentId - Student's MongoDB ID
 * @param {string} trafftCustomerId - Trafft customer ID
 */
export async function updateStudentWithTraffTId(studentId, trafftCustomerId) {
  try {
    // This would typically be handled in the registration API route
    // Just logging for now since we'll integrate it directly
    console.log(`Student ${studentId} linked to Trafft customer ${trafftCustomerId}`)
  } catch (error) {
    console.error('Error updating student with Trafft ID:', error)
  }
}