package com.backend.autoapplypro.modules.hr;

import com.backend.autoapplypro.modules.hr.dto.HrRequestDto;
import com.backend.autoapplypro.modules.hr.dto.HrResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hrs")
@RequiredArgsConstructor
public class HrController {

    private final HrService hrService;
    private final EmailEnrichmentService emailEnrichmentService;

    @PostMapping("/enrich-domain")
    public ResponseEntity<List<HrDetails>> enrichCompanyDomain(
            @RequestParam String domain,
            @RequestParam(required = false) String companyName) {
        List<HrDetails> enriched = emailEnrichmentService.enrichCompanyDomain(domain, companyName);
        return ResponseEntity.ok(enriched);
    }

    @PostMapping
    public ResponseEntity<HrResponseDto> createHr(@RequestBody HrRequestDto hrRequestDto) {
        return new ResponseEntity<>(hrService.saveHr(hrRequestDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<HrResponseDto>> getAllHrs() {
        return ResponseEntity.ok(hrService.getAllHrs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HrResponseDto> getHrById(@PathVariable Long id) {
        return ResponseEntity.ok(hrService.getHrById(id));
    }

    @GetMapping("/company")
    public ResponseEntity<List<HrResponseDto>> getHrsByCompany(@RequestParam String companyName) {
        return ResponseEntity.ok(hrService.getHrsByCompany(companyName));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HrResponseDto> updateHr(@PathVariable Long id, @RequestBody HrRequestDto hrRequestDto) {
        return ResponseEntity.ok(hrService.updateHr(id, hrRequestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHr(@PathVariable Long id) {
        hrService.deleteHr(id);
        return ResponseEntity.noContent().build();
    }
}
