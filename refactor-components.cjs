const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const allFiles = walk(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Candidate Store Replacements
  if (content.includes('useCandidateStore')) {
    content = content.replace(/import \{ useCandidateStore \} from '\.\.\/\.\.\/store\/candidateStore'/g, "import { useCandidates, useDeleteCandidate, useUpdateCandidate, useAddCandidate, useUpdatePantukhirStatus, useUpdateHomeVisitStatus, useBulkUpdateHomeVisitStatus, useBulkAddCandidates } from '../../hooks/useCandidates'");
    content = content.replace(/import \{ useCandidateStore \} from '\.\.\/store\/candidateStore'/g, "import { useCandidates, useDeleteCandidate, useUpdateCandidate, useAddCandidate, useUpdatePantukhirStatus, useUpdateHomeVisitStatus, useBulkUpdateHomeVisitStatus, useBulkAddCandidates } from '../hooks/useCandidates'");
    
    // Hooks initialization
    content = content.replace(/const candidates = useCandidateStore\(\(state\) => state\.candidates\)/g, "const { data: candidates = [] } = useCandidates()");
    content = content.replace(/const deleteCandidate = useCandidateStore\(\(state\) => state\.deleteCandidate\)/g, "const { mutateAsync: deleteCandidate } = useDeleteCandidate()");
    content = content.replace(/const updateCandidate = useCandidateStore\(\(state\) => state\.updateCandidate\)/g, "const { mutateAsync: updateCandidate } = useUpdateCandidate()");
    content = content.replace(/const addCandidate = useCandidateStore\(\(state\) => state\.addCandidate\)/g, "const { mutateAsync: addCandidate } = useAddCandidate()");
    content = content.replace(/const bulkAddCandidates = useCandidateStore\(\(state\) => state\.bulkAddCandidates\)/g, "const { mutateAsync: bulkAddCandidates } = useBulkAddCandidates()");
    content = content.replace(/const updatePantukhirStatus = useCandidateStore\(\(state\) => state\.updatePantukhirStatus\)/g, "const { mutateAsync: updatePantukhirStatus } = useUpdatePantukhirStatus()");
    content = content.replace(/const updateStatus = useCandidateStore\(\(state\) => state\.updateHomeVisitStatus\)/g, "const { mutateAsync: updateStatus } = useUpdateHomeVisitStatus()");
    content = content.replace(/const bulkUpdateStatus = useCandidateStore\(\(state\) => state\.bulkUpdateHomeVisitStatus\)/g, "const { mutateAsync: bulkUpdateStatus } = useBulkUpdateHomeVisitStatus()");

    // Remove loadFromAPI calls
    content = content.replace(/useCandidateStore\.getState\(\)\.loadFromAPI\(\)/g, "");
    content = content.replace(/const loadCandidates = useCandidateStore\(\(state\) => state\.loadFromAPI\)/g, "");
    content = content.replace(/loadCandidates\(\)/g, "");
  }

  // 2. Visitor Store Replacements
  if (content.includes('useVisitorStore')) {
    content = content.replace(/import \{ useVisitorStore \} from '\.\.\/\.\.\/store\/visitorStore'/g, "import { useVisitors, useDeleteVisitor, useUpdateVisitor, useAddVisitor, useBulkAddVisitors } from '../../hooks/useVisitors'");
    
    content = content.replace(/const visitors = useVisitorStore\(\(state\) => state\.visitors\)/g, "const { data: visitors = [] } = useVisitors()");
    content = content.replace(/const deleteVisitor = useVisitorStore\(\(state\) => state\.deleteVisitor\)/g, "const { mutateAsync: deleteVisitor } = useDeleteVisitor()");
    content = content.replace(/const updateVisitor = useVisitorStore\(\(state\) => state\.updateVisitor\)/g, "const { mutateAsync: updateVisitor } = useUpdateVisitor()");
    content = content.replace(/const addVisitor = useVisitorStore\(\(state\) => state\.addVisitor\)/g, "const { mutateAsync: addVisitor } = useAddVisitor()");
    content = content.replace(/const bulkAddVisitors = useVisitorStore\(\(state\) => state\.bulkAddVisitors\)/g, "const { mutateAsync: bulkAddVisitors } = useBulkAddVisitors()");
    
    content = content.replace(/useVisitorStore\.getState\(\)\.loadFromAPI\(\)/g, "");
  }

  // 3. Instrument Store Replacements
  if (content.includes('useInstrumentStore')) {
    content = content.replace(/import \{ useInstrumentStore \} from '\.\.\/\.\.\/store\/instrumentStore'/g, "import { useInstruments, useDeleteInstrument, useUpdateInstrument, useAddInstrument, useBulkAddInstruments } from '../../hooks/useInstruments'");
    
    content = content.replace(/const instruments = useInstrumentStore\(\(state\) => state\.instruments\)/g, "const { data: instruments = [] } = useInstruments()");
    content = content.replace(/const deleteInstrument = useInstrumentStore\(\(state\) => state\.deleteInstrument\)/g, "const { mutateAsync: deleteInstrument } = useDeleteInstrument()");
    content = content.replace(/const updateInstrument = useInstrumentStore\(\(state\) => state\.updateInstrument\)/g, "const { mutateAsync: updateInstrument } = useUpdateInstrument()");
    content = content.replace(/const addInstrument = useInstrumentStore\(\(state\) => state\.addInstrument\)/g, "const { mutateAsync: addInstrument } = useAddInstrument()");
    content = content.replace(/const bulkAddInstruments = useInstrumentStore\(\(state\) => state\.bulkAddInstruments\)/g, "const { mutateAsync: bulkAddInstruments } = useBulkAddInstruments()");
    
    content = content.replace(/useInstrumentStore\.getState\(\)\.loadFromAPI\(\)/g, "");
  }

  // 4. Schedule Store Replacements
  if (content.includes('useScheduleStore')) {
    content = content.replace(/import \{ useScheduleStore \} from '\.\.\/\.\.\/store\/scheduleStore'/g, "import { useSchedules, useDeleteSchedule, useUpdateSchedule, useAddSchedule, useBulkAddSchedules } from '../../hooks/useSchedules'");
    
    content = content.replace(/const schedules = useScheduleStore\(\(state\) => state\.schedules\)/g, "const { data: schedules = [] } = useSchedules()");
    content = content.replace(/const deleteSchedule = useScheduleStore\(\(state\) => state\.deleteSchedule\)/g, "const { mutateAsync: deleteSchedule } = useDeleteSchedule()");
    content = content.replace(/const updateSchedule = useScheduleStore\(\(state\) => state\.updateSchedule\)/g, "const { mutateAsync: updateSchedule } = useUpdateSchedule()");
    content = content.replace(/const addSchedule = useScheduleStore\(\(state\) => state\.addSchedule\)/g, "const { mutateAsync: addSchedule } = useAddSchedule()");
    content = content.replace(/const bulkAddSchedules = useScheduleStore\(\(state\) => state\.bulkAddSchedules\)/g, "const { mutateAsync: bulkAddSchedules } = useBulkAddSchedules()");
    
    content = content.replace(/useScheduleStore\.getState\(\)\.loadFromAPI\(\)/g, "");
  }

  // 5. Region Store Replacements
  if (content.includes('useRegionStore')) {
    content = content.replace(/import \{ useRegionStore \} from '\.\.\/\.\.\/store\/regionStore'/g, "import { useRegions, useCampuses, useAddRegion, useDeleteRegion, useUpdateRegion, useAddCampus, useDeleteCampus, useUpdateCampus } from '../../hooks/useRegions'");
    
    content = content.replace(/const regions = useRegionStore\(\(state\) => state\.regions\)/g, "const { data: regions = [] } = useRegions()");
    content = content.replace(/const campuses = useRegionStore\(\(state\) => state\.campuses\)/g, "const { data: campuses = [] } = useCampuses()");
    
    content = content.replace(/const deleteRegion = useRegionStore\(\(state\) => state\.deleteRegion\)/g, "const { mutateAsync: deleteRegion } = useDeleteRegion()");
    content = content.replace(/const updateRegion = useRegionStore\(\(state\) => state\.updateRegion\)/g, "const { mutateAsync: updateRegion } = useUpdateRegion()");
    content = content.replace(/const addRegion = useRegionStore\(\(state\) => state\.addRegion\)/g, "const { mutateAsync: addRegion } = useAddRegion()");
    
    content = content.replace(/const deleteCampus = useRegionStore\(\(state\) => state\.deleteCampus\)/g, "const { mutateAsync: deleteCampus } = useDeleteCampus()");
    content = content.replace(/const updateCampus = useRegionStore\(\(state\) => state\.updateCampus\)/g, "const { mutateAsync: updateCampus } = useUpdateCampus()");
    content = content.replace(/const addCampus = useRegionStore\(\(state\) => state\.addCampus\)/g, "const { mutateAsync: addCampus } = useAddCampus()");

    content = content.replace(/useRegionStore\.getState\(\)\.loadFromAPI\(\)/g, "");
  }

  // 6. Home Visit Results Store
  if (content.includes('useHomeVisitStore')) {
    content = content.replace(/import \{ useHomeVisitStore(?:, HomeVisitResult)? \} from '\.\.\/\.\.\/store\/homeVisitStore'/g, "import { useHomeVisitResults, useAddHomeVisitResult, useUpdateHomeVisitResult } from '../../hooks/useHomeVisitResults';\nimport type { HomeVisitResult } from '../../types'");
    
    content = content.replace(/const results = useHomeVisitStore\(\(state\) => state\.results\)/g, "const { data: results = [] } = useHomeVisitResults()");
    content = content.replace(/const addResult = useHomeVisitStore\(\(state: any\) => state\.addResult\)/g, "const { mutateAsync: addResult } = useAddHomeVisitResult()");
    content = content.replace(/const updateResult = useHomeVisitStore\(\(state\) => state\.updateResult\)/g, "const { mutateAsync: updateResult } = useUpdateHomeVisitResult()");
    
    content = content.replace(/useHomeVisitStore\.getState\(\)\.loadFromAPI\(\)/g, "");
  }

  // Fixing mutations params where they are passed as two args instead of object for updates
  // For updateCandidate(id, updates) -> updateCandidate({id, updates})
  content = content.replace(/updateCandidate\(([^,]+), ([^)]+)\)/g, "updateCandidate({id: $1, updates: $2})");
  content = content.replace(/updateVisitor\(([^,]+), ([^)]+)\)/g, "updateVisitor({id: $1, updates: $2})");
  content = content.replace(/updateInstrument\(([^,]+), ([^)]+)\)/g, "updateInstrument({id: $1, updates: $2})");
  content = content.replace(/updateSchedule\(([^,]+), ([^)]+)\)/g, "updateSchedule({id: $1, updates: $2})");
  content = content.replace(/updateRegion\(([^,]+), ([^)]+)\)/g, "updateRegion({id: $1, name: $2})");
  content = content.replace(/updateCampus\(([^,]+), ([^,]+), ([^)]+)\)/g, "updateCampus({id: $1, name: $2, regionId: $3})");
  
  content = content.replace(/updatePantukhirStatus\(([^,]+), ([^)]+)\)/g, "updatePantukhirStatus({id: $1, status: $2})");
  content = content.replace(/updateStatus\(([^,]+), ([^)]+)\)/g, "updateStatus({id: $1, status: $2})");
  content = content.replace(/bulkUpdateStatus\(([^,]+), ([^)]+)\)/g, "bulkUpdateStatus({ids: $1, status: $2})");


  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
