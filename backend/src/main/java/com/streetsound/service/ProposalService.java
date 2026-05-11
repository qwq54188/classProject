package com.streetsound.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.streetsound.entity.Proposal;
import com.streetsound.mapper.ProposalMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProposalService {
    @Autowired
    private ProposalMapper proposalMapper;

    public Proposal create(Proposal proposal) {
        proposal.setStatus(0);
        proposalMapper.insert(proposal);
        return proposal;
    }

    public List<Proposal> list(String category, Integer status, String sortBy) {
        LambdaQueryWrapper<Proposal> wrapper = new LambdaQueryWrapper<>();
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Proposal::getCategory, category);
        }
        if (status != null) {
            wrapper.eq(Proposal::getStatus, status);
        }
        if ("voteCount".equals(sortBy)) {
            wrapper.orderByDesc(Proposal::getCreateTime);
        } else {
            wrapper.orderByDesc(Proposal::getCreateTime);
        }
        return proposalMapper.selectList(wrapper);
    }

    public Proposal getById(Long id) {
        return proposalMapper.selectById(id);
    }

    public void updateStatus(Long id, Integer status, String resultDesc, String resultPhotoUrl) {
        LambdaUpdateWrapper<Proposal> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Proposal::getId, id);
        wrapper.set(Proposal::getStatus, status);
        wrapper.set(Proposal::getResultDesc, resultDesc);
        wrapper.set(Proposal::getResultPhotoUrl, resultPhotoUrl);
        proposalMapper.update(null, wrapper);
    }
}
