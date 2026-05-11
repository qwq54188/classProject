package com.streetsound.controller;

import com.streetsound.entity.Proposal;
import com.streetsound.entity.User;
import com.streetsound.service.ProposalService;
import com.streetsound.service.VoteService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/proposals")
@CrossOrigin
public class ProposalController {
    @Autowired
    private ProposalService proposalService;

    @Autowired
    private VoteService voteService;

    @PostMapping
    public Map<String, Object> create(@RequestBody Proposal proposal, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        User user = (User) session.getAttribute("user");
        if (user == null) {
            result.put("success", false);
            result.put("message", "请先登录");
            return result;
        }
        proposal.setCreatorId(user.getId());
        Proposal created = proposalService.create(proposal);
        result.put("success", true);
        result.put("proposal", created);
        return result;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String category,
                                       @RequestParam(required = false) Integer status,
                                       @RequestParam(required = false) String sortBy) {
        Map<String, Object> result = new HashMap<>();
        List<Proposal> proposals = proposalService.list(category, status, sortBy);
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Proposal p : proposals) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("title", p.getTitle());
            map.put("description", p.getDescription());
            map.put("photoUrl", p.getPhotoUrl());
            map.put("category", p.getCategory());
            map.put("locationName", p.getLocationName());
            map.put("status", p.getStatus());
            map.put("resultDesc", p.getResultDesc());
            map.put("resultPhotoUrl", p.getResultPhotoUrl());
            map.put("creatorId", p.getCreatorId());
            map.put("createTime", p.getCreateTime());
            map.put("voteCount", voteService.countByProposalId(p.getId()));
            resultList.add(map);
        }
        result.put("success", true);
        result.put("proposals", resultList);
        return result;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable Long id, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        Proposal proposal = proposalService.getById(id);
        if (proposal != null) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", proposal.getId());
            map.put("title", proposal.getTitle());
            map.put("description", proposal.getDescription());
            map.put("photoUrl", proposal.getPhotoUrl());
            map.put("category", proposal.getCategory());
            map.put("locationName", proposal.getLocationName());
            map.put("status", proposal.getStatus());
            map.put("resultDesc", proposal.getResultDesc());
            map.put("resultPhotoUrl", proposal.getResultPhotoUrl());
            map.put("creatorId", proposal.getCreatorId());
            map.put("createTime", proposal.getCreateTime());
            map.put("voteCount", voteService.countByProposalId(id));
            
            User user = (User) session.getAttribute("user");
            if (user != null) {
                map.put("hasVoted", voteService.hasVoted(id, user.getId()));
            } else {
                map.put("hasVoted", false);
            }
            
            result.put("success", true);
            result.put("proposal", map);
        } else {
            result.put("success", false);
            result.put("message", "提案不存在");
        }
        return result;
    }

    @PostMapping("/{id}/vote")
    public Map<String, Object> vote(@PathVariable Long id, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        User user = (User) session.getAttribute("user");
        if (user == null) {
            result.put("success", false);
            result.put("message", "请先登录");
            return result;
        }
        boolean success = voteService.vote(id, user.getId());
        if (success) {
            result.put("success", true);
            result.put("voteCount", voteService.countByProposalId(id));
        } else {
            result.put("success", false);
            result.put("message", "已附议");
        }
        return result;
    }

    @PutMapping("/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable Long id,
                                               @RequestBody Map<String, Object> params,
                                               HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        User user = (User) session.getAttribute("user");
        if (user == null || user.getRole() != 1) {
            result.put("success", false);
            result.put("message", "无权限");
            return result;
        }
        Integer status = (Integer) params.get("status");
        String resultDesc = (String) params.get("resultDesc");
        String resultPhotoUrl = (String) params.get("resultPhotoUrl");
        proposalService.updateStatus(id, status, resultDesc, resultPhotoUrl);
        result.put("success", true);
        return result;
    }
}
