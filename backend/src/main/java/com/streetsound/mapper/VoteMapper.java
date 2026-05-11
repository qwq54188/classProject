package com.streetsound.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.streetsound.entity.Vote;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VoteMapper extends BaseMapper<Vote> {
}
