package com.streetsound.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.streetsound.entity.Vote;
import com.streetsound.mapper.VoteMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class VoteService {
    @Autowired
    private VoteMapper voteMapper;

    public boolean vote(Long proposalId, Long userId) {
        try {
            Vote vote = new Vote();
            vote.setProposalId(proposalId);
            vote.setUserId(userId);
            voteMapper.insert(vote);
            return true;
        } catch (DuplicateKeyException e) {
            return false;
        }
    }

    public Long countByProposalId(Long proposalId) {
        LambdaQueryWrapper<Vote> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Vote::getProposalId, proposalId);
        return voteMapper.selectCount(wrapper);
    }

    public boolean hasVoted(Long proposalId, Long userId) {
        LambdaQueryWrapper<Vote> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Vote::getProposalId, proposalId);
        wrapper.eq(Vote::getUserId, userId);
        return voteMapper.selectCount(wrapper) > 0;
    }
}
