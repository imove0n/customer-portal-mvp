// ServiceM8 API Integration
require('dotenv').config();

const SERVICEM8_API_KEY = process.env.SERVICEM8_API_KEY;
const SERVICEM8_BASE_URL = 'https://api.servicem8.com/api_1.0';

/**
 * Make a request to ServiceM8 API
 * @param {string} endpoint - API endpoint (e.g., 'job.json', 'company.json')
 * @param {object} options - Fetch options
 */
async function servicem8Request(endpoint, options = {}) {
  const url = `${SERVICEM8_BASE_URL}/${endpoint}`;

  // ServiceM8 uses Basic Auth with API Key as password and empty username
  const auth = Buffer.from(`:${SERVICEM8_API_KEY}`).toString('base64');

  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ServiceM8 API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ServiceM8 API Request Failed:', error.message);
    throw error;
  }
}

/**
 * Fetch all jobs from ServiceM8
 */
async function getJobs() {
  return await servicem8Request('job.json');
}

/**
 * Fetch a specific job by UUID
 */
async function getJob(uuid) {
  return await servicem8Request(`job/${uuid}.json`);
}

/**
 * Fetch company information
 */
async function getCompanyInfo() {
  return await servicem8Request('company.json');
}

/**
 * Fetch staff members
 */
async function getStaff() {
  return await servicem8Request('staff.json');
}

/**
 * Fetch attachments for a job
 */
async function getJobAttachments(jobUuid) {
  return await servicem8Request(`attachment.json?%24filter=related_object_uuid%20eq%20%27${jobUuid}%27`);
}

/**
 * Create a new note for a job
 */
async function createJobNote(jobUuid, noteText) {
  return await servicem8Request('jobnote.json', {
    method: 'POST',
    body: JSON.stringify({
      job_uuid: jobUuid,
      note: noteText,
      timestamp: new Date().toISOString()
    })
  });
}

module.exports = {
  servicem8Request,
  getJobs,
  getJob,
  getCompanyInfo,
  getStaff,
  getJobAttachments,
  createJobNote
};
